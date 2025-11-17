package bitc.full502.backend.repository;

import bitc.full502.backend.entity.NoticeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface NoticeRepository extends JpaRepository<NoticeEntity, Integer> {
    List<NoticeEntity> findByNtCodeIn(List<Integer> codes);

    // 공지사항 게시글 기간 설정 (시작일, 종료일, 2개월 후 자동삭제) : jin 추가
    void deleteByEndDateBefore(LocalDate date);
}