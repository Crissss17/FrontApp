export type RootStackParamList = {
  Login: undefined;  // No recibe parámetros
  Register: undefined;  // No recibe parámetros
  ForgotPass: undefined;  // No recibe parámetros
  TokenScreen: { accessToken: string; refreshToken: string };  // Recibe tokens
  ListadoCuestionarios: undefined;  // No recibe parámetros
  Cuestionario: { cuestionarioId: string };  // Recibe el ID del cuestionario
};
