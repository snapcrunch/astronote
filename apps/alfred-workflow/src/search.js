import alfy from 'alfy';

const apiUrl = (process.env.api_url || '').replace(/\/api\/?$/, '');
const apiToken = process.env.api_token;

if (!apiUrl || !apiToken) {
  alfy.output([
    {
      title: 'Astronote not configured',
      subtitle: 'Set api_url and api_token in workflow variables',
      valid: false,
    },
  ]);
  process.exit(0);
}

const query = alfy.input.trim();

if (!query) {
  alfy.output([]);
  process.exit(0);
}

try {
  const notes = await alfy.fetch(`${apiUrl}/api/notes`, {
    searchParams: { q: query },
    headers: { Authorization: `Bearer ${apiToken}` },
  });

  if (notes.length === 0) {
    alfy.output([
      {
        title: `Create note: ${query}`,
        subtitle: 'Press Enter to create and open this note',
        arg: `create:${query}`,
        icon: { path: 'icon.png' },
      },
    ]);
  } else {
    const items = notes.map((note) => ({
      title: note.title,
      subtitle: note.tags.length > 0 ? note.tags.join(', ') : '',
      arg: String(note.id),
      icon: { path: 'icon.png' },
    }));

    alfy.output(items);
  }
} catch (error) {
  alfy.output([
    {
      title: 'Error searching notes',
      subtitle: error.message || 'Unknown error',
      valid: false,
    },
  ]);
}
