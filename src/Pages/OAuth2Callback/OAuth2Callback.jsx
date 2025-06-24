import { useEffect } from 'react';

export default function OAuth2Callback() {
  useEffect(() => {
    const hash = window.location.hash.substr(1);
    const params = new URLSearchParams(hash);
    const access_token = params.get('access_token');
    if (access_token) {
      window.opener.postMessage({
        type: 'google_access_token',
        access_token,
      }, window.location.origin);
      window.close();
    }
  }, []);
  return <div>Loading...</div>;
}
