package bitc.full502.backend.service;

import bitc.full502.backend.dto.NoticeDto;
import bitc.full502.backend.entity.NoticeEntity;

import java.util.List;

public interface NoticeService {

    NoticeEntity createNotice(NoticeDto dto);
    List<NoticeEntity> getNoticesByCodes(List<Integer> codes);

    void deleteNotices(List<Integer> ids);

    NoticeEntity updateNotice(Integer id, NoticeDto dto);

    // 공지사항 게시글 기간 설정 (시작일, 종료일, 2개월 후 자동삭제) : jin 추가
    void deleteExpiredNotices();
}