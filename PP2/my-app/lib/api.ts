export async function fetchTemplates() {
    const response = await fetch('/api/templates');
    if (!response.ok) {
      throw new Error('Failed to fetch templates');
    }
    return response.json();
  }