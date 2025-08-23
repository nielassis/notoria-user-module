export function generateWelcomeEmailHtml(
  student: string,
  studentEmail: string,
  teacher: string,
  password: string
) {
  return `
  <div style="font-family: Arial, sans-serif; background-color: #f5f5f7; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="background-color: #4f46e5; color: #ffffff; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">🎓 Notoria</h1>
      </div>
      
      <!-- Body -->
      <div style="padding: 30px; color: #333333;">
        <p style="font-size: 16px;">Olá, <strong>${student}</strong>,</p>
        <p style="font-size: 16px;"><strong>${teacher}</strong> te convidou para o Notoria.</p>

        <p style="font-size: 16px;">
          Notoria é mais do que um sistema de gestão de alunos: é sua forma de acompanhar atividades, receber feedback e organizar seus estudos de maneira simples e eficiente.
        </p>

        <h3 style="color: #4f46e5;">Estamos ansiosos para ter você a bordo!</h3>
        <p style="font-size: 16px;">
          Agora você faz parte de uma plataforma que facilita a gestão das suas atividades, conectando todos os envolvidos.
        </p>

        <h3 style="margin-top: 30px; color: #4f46e5;">Suas credenciais:</h3>´
        <p style="font-size: 16px; margin: 5px 0;">Sugerimos que altere a sua senha nas configurações de perfil após o seu primeiro acesso.</strong></p>
        <p style="font-size: 16px; margin: 5px 0;">Email: <strong>${studentEmail}</strong></p>
        <p style="font-size: 16px; margin: 5px 0;">Senha provisória: <strong>${password}</strong></p>

        <div style="text-align: center; margin-top: 20px;">
          <a href="https://notoria-edu.vercell.app/login" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Entrar com minha conta no Notoria
          </a>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #888888;">
        <p>Notoria &copy; 2025. Todos os direitos reservados.</p>
      </div>

    </div>
  </div>
  `;
}
