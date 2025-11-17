package bitc.full502.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "notice")
public class NoticeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "nt_key")
    private Integer ntKey;

    @Column(name = "nt_code", nullable = false)
    private Integer ntCode; // 1=본사, 2=물류, 3=대리점, 0=전체

    @Column(name = "nt_category", nullable = false)
    private String ntCategory; // 전체, 주문, 출고, 배송, 제품현황

    @Column(name = "nt_content", nullable = false, columnDefinition = "TEXT")
    private String ntContent;

    @Column(name = "at_created", updatable = false)
    private LocalDateTime atCreated;

    @Column(name = "at_updated")
    private LocalDateTime atUpdated;

    @PrePersist
    public void prePersist() {
        this.atCreated = LocalDateTime.now();
        this.atUpdated = LocalDateTime.now();
        // 공지사항 시작일, 종료일 추가 : jin 추가
        // 새로운 엔티티일 때만 기본값 설정
        if (ntKey == null) {  // 새 엔티티인 경우에만
            if (startDate == null) {
                startDate = LocalDate.now();
            }
            if (endDate == null) {
                endDate = LocalDate.now().plusMonths(2);
            }
        }
        if (startDate == null) startDate = LocalDate.now();
        if (endDate == null) endDate = LocalDate.now().plusMonths(2);
    }

    @PreUpdate
    public void preUpdate() {
        this.atUpdated = LocalDateTime.now();
    }

    // 공지사항 게시글 기간 설정 (시작일, 종료일, 2개월 후 자동삭제) : jin 추가
    @Column(name = "start_date", nullable = true)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = true)
    private LocalDate endDate;
}

