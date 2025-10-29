const axios = require('axios');
const API = 'https://backendgias.onrender.com/api/auth/login';

describe('Login GIAS', () => {
  it('Debe iniciar sesión con credenciales válidas', async () => {
    const response = await axios.post(API, {
      correo: "20221059@uthh.edu.mx",
      password: "Edder420*"
    });
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('token');
  });

  it('Debe rechazar credenciales inválidas', async () => {
    try {
      await axios.post(API, { correo: "fake@test.com", password: "wrong" });
      throw new Error('El login no debería aceptar credenciales inválidas');
    } catch (err) {
      const status = err.response?.status;
      expect([400, 401]).toContain(status);
    }
  });
});
