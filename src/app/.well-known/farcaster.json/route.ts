export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL;

  const config = {
    accountAssociation: {
      header:
        'eyJmaWQiOjE5NjMyOCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDMwM0JlMDNiMkExQjVlMkViQjQzZEQ0NkEyYWFDZjk1YzJhQTVBODQifQ',
      payload: 'eyJkb21haW4iOiJnbmFycy5jb20ifQ',
      signature:
        'MHg5ZWEzNWEyNGM0NDZjNmU2NGQxN2RlOGU4MjY4Y2QwZDExYzBjODFkOWE2NDA1NTRiNTMzMjYzMTM2MTFiZmYxMmU0YmIyMjc2ZDllZjUyOGQ4NWY1NGQ4N2E2NTUyMTlkZmViZjIxODk4NmM0MmZkMGViNjZjZWY4YzI0NzIwMzFi',
    },
    frame: {
      version: '1',
      name: 'Gnars Auction',
      iconUrl: `${appUrl}/images/gnars.webp`,
      homeUrl: appUrl,
      imageUrl: `${appUrl}/frames/auction/opengraph-image`,
      buttonTitle: 'Launch Frame',
      splashImageUrl: `${appUrl}/images/gnars.webp`,
      splashBackgroundColor: '#f7f7f7',
      webhookUrl: `${appUrl}/api/webhook`,
    },
  };

  return Response.json(config);
}
