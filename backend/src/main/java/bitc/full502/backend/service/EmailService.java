package bitc.full502.backend.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

  private final JavaMailSender mailSender;

  public boolean sendResetPasswordEmail(String toEmail, String token) {
    String resetUrl = "http://localhost:5173/resetPw?token=" + token; // 프론트 주소

    SimpleMailMessage message = new SimpleMailMessage();
    message.setTo(toEmail);
    message.setSubject("비밀번호 재설정 안내");
    message.setText("안녕하세요.\n아래 링크를 클릭하여 비밀번호를 재설정해주세요.\n" + resetUrl + "\n(30분 후 링크 만료)");

    try {
      System.out.println("[EmailService] 발송 시도: " + toEmail);
      mailSender.send(message);
      System.out.println("[EmailService] 이메일 발송 성공");
      return true;
    } catch (Exception e) {
      System.err.println("[EmailService] 이메일 발송 실패: " + e.getMessage());
      e.printStackTrace();
      return false;
    }
  }
}
