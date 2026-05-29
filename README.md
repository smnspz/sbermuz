# sbermuz.club
> Website for Collettivo Sbermuz.

Static bilingual (IT/EN) website built with Astro, Preact and Tailwind CSS. 

Event listings, photo gallery and detail pages are driven by a Directus CMS backend.

## Installation

```sh
pnpm install
```

Requires Node >= 22.12.0. Copy `.env.example` to `.env` and set the Directus API URL.

## Usage example

```sh
pnpm dev      # local dev server on localhost:4321
pnpm build    # production build to ./dist/
pnpm preview  # preview the build locally
```

## Development setup

```sh
git clone <repo-url>
cd sbermuz
pnpm install
cp .env.example .env   # fill in DIRECTUS_URL
```

Directus runs on a remote server. To access it locally, open an SSH tunnel:

```sh
ssh -N -f -L 8055:localhost:8055 user@remote_server
```

Then start the dev server:

```sh
pnpm dev
```

To kill the background tunnel when done:

```sh
pkill -f "ssh -N -f -L 8055"
```

## Release History

- **0.0.1** - Initial release.

## Contributing

Not open for contributions at this time.

## License

All rights reserved.
