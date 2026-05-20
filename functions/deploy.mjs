import jwt from 'jsonwebtoken';

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  const secret = process.env.JWT_SECRET;

  if (!secret || !token) return json({ error: 'Unauthorized' }, 401);

  try { jwt.verify(token, secret); }
  catch { return json({ error: 'Token expired or invalid' }, 401); }

  const { type, data } = await req.json();
  if (!type || !data || !['portfolio', 'blog', 'gallery'].includes(type))
    return json({ error: 'Invalid request' }, 400);

  const ghToken = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';

  if (!ghToken || !repo) return json({ error: 'Server not configured' }, 500);

  const gh = (url, opts = {}) =>
    fetch('https://api.github.com' + url, {
      ...opts,
      headers: {
        'Authorization': 'token ' + ghToken,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'kitayangdesain-admin',
        ...opts.headers
      }
    });

  try {
    // 1. Get current branch ref
    const refRes = await gh(`/repos/${repo}/git/refs/heads/${branch}`);
    if (!refRes.ok) {
      const detail = await refRes.text();
      return json({ error: 'Failed to get branch ref', detail: `${repo}/${branch}: ${refRes.status}` }, 502);
    }
    const { object: { sha: commitSha } } = await refRes.json();

    // 2. Get current commit (for tree SHA)
    const commitRes = await gh(`/repos/${repo}/git/commits/${commitSha}`);
    if (!commitRes.ok) return json({ error: 'Failed to get commit' }, 502);
    const { tree: { sha: treeSha } } = await commitRes.json();

    // 3. Create blob
    const content = JSON.stringify(data, null, 2);
    const blobRes = await gh(`/repos/${repo}/git/blobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, encoding: 'utf-8' })
    });
    if (!blobRes.ok) return json({ error: 'Failed to create blob' }, 502);
    const { sha: blobSha } = await blobRes.json();

    // 4. Create tree
    const treeRes = await gh(`/repos/${repo}/git/trees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base_tree: treeSha,
        tree: [{ path: `data/${type}.json`, mode: '100644', type: 'blob', sha: blobSha }]
      })
    });
    if (!treeRes.ok) return json({ error: 'Failed to create tree' }, 502);
    const { sha: newTreeSha } = await treeRes.json();

    // 5. Create commit
    const msg = `Update ${type} via admin panel`;
    const newCommitRes = await gh(`/repos/${repo}/git/commits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, tree: newTreeSha, parents: [commitSha] })
    });
    if (!newCommitRes.ok) return json({ error: 'Failed to create commit' }, 502);
    const { sha: newCommitSha } = await newCommitRes.json();

    // 6. Update ref
    const updateRes = await gh(`/repos/${repo}/git/refs/heads/${branch}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sha: newCommitSha, force: false })
    });
    if (!updateRes.ok) return json({ error: 'Failed to update branch' }, 502);

    return json({
      success: true,
      commit: `https://github.com/${repo}/commit/${newCommitSha}`,
      message: `${type}.json updated`
    }, 200);

  } catch (err) {
    return json({ error: 'Deploy failed', detail: err.message }, 500);
  }
};

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
