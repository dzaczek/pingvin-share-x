# Cloudflare challenge on a JavaScript asset

The share page stopped loading when Cloudflare returned a challenge for
`/_next/static/chunks/pages/share/%5BshareId%5D-188f0c0a65550eeb.js`.
The response was `403`, `cf-mitigated: challenge`, and `Content-Type: text/html`.
A script request cannot execute that HTML as JavaScript.

The VirusTotal feature requests a file's SHA-256 only when an administrator
clicks its button. Adding that feature also changes the share page's JavaScript
bundle, including its content hash and URL.

`frontend/next.config.js` sets a fixed `outputHashSalt` to rotate the generated
asset URLs while preserving content-based cache invalidation. Next.js updates
the manifests and runtime references during the build; no files are renamed
afterward. VirusTotal and the WAF configuration are unchanged.

This is a workaround for the observed false positive. No filename scheme can
guarantee a particular score from Cloudflare's request classifier.

## Verify a deployment

Build a new image from this change; restarting an existing image does not change
its assets. After deployment, open a share and inspect the Network panel:

- Its script URLs must reference the new build, not the challenged hash above.
- JavaScript requests must return `200` with a JavaScript content type and no
  `cf-mitigated: challenge` header.
- Check both an anonymous visit (where allowed) and the admin VirusTotal button.

A new asset URL returning `404` before deployment only shows that the request was
not challenged in that test; it does not establish that the new build works.
If a later build is challenged, inspect its Security Event before changing the
salt or the WAF rules. Do not broadly exempt all of `/_next/` from protection.

Reference: [Next.js outputHashSalt](https://nextjs.org/docs/app/api-reference/config/next-config-js/outputHashSalt).
