

// esto vera si estamos en modo local o remota
const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';

// poneemos las url de local y remota
export const BASE_URL = isLocalhost 
    ? 'http://localhost:5000/api'               
    : 'https://comercio-pachacamac-v2.onrender.com/api';

export default BASE_URL;