package bitc.full502.backend.service;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.MimeMessageHelper;

@Service
@RequiredArgsConstructor
public class EmailService {

  private final JavaMailSender mailSender;

  public boolean sendResetPasswordEmail(String toEmail, String token) {
    String resetUrl = "http://localhost:5173/resetPw?token=" + token; // 프론트 주소

    MimeMessage message = mailSender.createMimeMessage();

    try {
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
      helper.setTo(toEmail);
      helper.setSubject("비밀번호 재설정 안내");

      String htmlContent = "<p>안녕하세요.</p>"
          + "<p>아래 링크를 클릭하여 비밀번호를 재설정해주세요.</p>"
          + "<p><a href=\"" + resetUrl + "\">" + resetUrl + "</a></p>"
          + "<p>(30분 후 링크 만료)</p>";

      helper.setText(htmlContent, true);

      System.out.println("[EmailService] 발송 시도: " + toEmail);
      mailSender.send(message);
      System.out.println("[EmailService] 이메일 발송 성공");
      return true;
    } catch (MessagingException e) {
      System.err.println("[EmailService] 이메일 발송 실패: " + e.getMessage());
      e.printStackTrace();
      return false;
    }
  }
}
