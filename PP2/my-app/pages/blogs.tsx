import { useState, useEffect } from 'react';
import axios from 'axios';

interface Post {
  id: string;
  title: string;
  description: string;
  content: string;
  tags: { tag: string }[]; // Tags are objects with a `tag` field
  codeTemplates: { id: string }[]; // Code templates are objects with an `id` field
}

interface NewPost {
  title: string;
  description: string;
  content: string;
  tags: string;
  codeTemplateIds: string;
}

const Blogs = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [newPost, setNewPost] = useState<NewPost>({
    title: '',
    description: '',
    content: '',
    tags: '',
    codeTemplateIds: '',
  });
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  // Fetch posts after login
  useEffect(() => {
    if (loggedIn) {
      const fetchPosts = async () => {
        try {
          const response = await axios.get<Post[]>('/api/posts', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
          });
          setPosts(response.data);
        } catch (err: any) {
          setError(err.response?.data?.message || 'Failed to fetch posts');
        } finally {
          setLoading(false);
        }
      };

      fetchPosts();
    }
  }, [loggedIn]);

  // Handle login
  const handleLogin = async () => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const token = response.data.token;

      // Store the token for subsequent requests
      localStorage.setItem('authToken', token);
      setLoggedIn(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login');
    }
  };

  const handleCreatePost = async () => {
    try {
      const tagsArray = newPost.tags.split(',').map((tag) => tag.trim());
      const codeTemplateIdsArray = newPost.codeTemplateIds
        .split(',')
        .map((id) => id.trim());

      const response = await axios.post<Post>('/api/posts', {
        ...newPost,
        tags: tagsArray,
        codeTemplateIds: codeTemplateIdsArray,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      setPosts([response.data, ...posts]);
      setNewPost({ title: '', description: '', content: '', tags: '', codeTemplateIds: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create post');
    }
  };

  if (!loggedIn) {
    return (
      <div>
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
        {error && <p>Error: {error}</p>}
      </div>
    );
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Blog Posts</h1>

      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <h2>{post.title}</h2>
            <p>{post.description}</p>
            <p>Tags: {(post.tags?.map((tag) => tag.tag) || []).join(', ') || 'No tags'}</p>
            <p>Code Templates: {(post.codeTemplates?.map((ct) => ct.id) || []).join(', ') || 'No templates'}</p>
          </li>
        ))}
      </ul>

      <h2>Create New Post</h2>
      <div>
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={newPost.title}
          onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={newPost.description}
          onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
        />
        <textarea
          name="content"
          placeholder="Content"
          value={newPost.content}
          onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
        />
        <input
          type="text"
          name="tags"
          placeholder="Tags (comma separated)"
          value={newPost.tags}
          onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
        />
        <input
          type="text"
          name="codeTemplateIds"
          placeholder="Code Template IDs (comma separated)"
          value={newPost.codeTemplateIds}
          onChange={(e) => setNewPost({ ...newPost, codeTemplateIds: e.target.value })}
        />
        <button onClick={handleCreatePost}>Create Post</button>
      </div>
    </div>
  );
};

export default Blogs;
