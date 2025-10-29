const axios = require('axios');

describe('Disponibilidad del backend GIAS', () => {
  it('El backend debe responder correctamente (status 200 o 304)', async () => {
    const response = await axios.get('https://backendgias.onrender.com/');
    expect([200, 304]).toContain(response.status);
  });
});
