# Deployment checklist — command.orvia.org.uk

1. Push this folder to a dedicated GitHub repository, recommended name `orvia-command-centre`.
2. Import that repository into Vercel.
3. Confirm build succeeds and review the generated `.vercel.app` URL.
4. Add Vercel environment variables before switching on private mode.
5. Enable `COMMAND_PRIVATE_MODE=true` and set reviewer credentials.
6. Add `command.orvia.org.uk` to the Vercel project.
7. Create the DNS record Vercel requests at the authoritative DNS provider for `orvia.org.uk`.
8. Confirm HTTPS and authentication work before sharing.
9. Keep `robots.txt` and `X-Robots-Tag: noindex` in place while this remains an internal review environment.
10. Only after approval, connect live Supabase feeds and apply the new `command_*` migration.
