package bitc.full502.backend.service;

import bitc.full502.backend.dto.NoticeDto;
import bitc.full502.backend.entity.NoticeEntity;
import bitc.full502.backend.repository.NoticeRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NoticeServiceImpl implements NoticeService {

    private final NoticeRepository noticeRepository;

    @Override
    public NoticeEntity createNotice(NoticeDto dto) {
        System.out.println("=== 새 공지사항 생성 ===");
        System.out.println("- 전달받은 시작일: " + dto.getStartDate());
        System.out.println("- 전달받은 종료일: " + dto.getEndDate());
        
        NoticeEntity notice = NoticeEntity.builder()
                .ntCode(dto.getNtCode())
                .ntCategory(dto.getNtCategory())
                .ntContent(dto.getNtContent())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .build();
                
        NoticeEntity savedNotice = noticeRepository.save(notice);
        System.out.println("=== 저장된 공지사항 ===");
        System.out.println("- 저장된 시작일: " + savedNotice.getStartDate());
        System.out.println("- 저장된 종료일: " + savedNotice.getEndDate());
        
        return savedNotice;
    }

    @Override
    public List<NoticeEntity> getNoticesByCodes(List<Integer> codes) {
        // codes: [0, 선택된 분류]
        return noticeRepository.findByNtCodeIn(codes);
    }

    @Override
    public void deleteNotices(List<Integer> ids) {
        noticeRepository.deleteAllById(ids);
    }

    @Override
    @Transactional
    public NoticeEntity updateNotice(Integer id, NoticeDto dto) {
        NoticeEntity notice = noticeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notice not found: " + id));
        
        System.out.println("=== 수정 전 공지사항 상태 ===");
        System.out.println("- ID: " + notice.getNtKey());
        System.out.println("- 시작일: " + notice.getStartDate());
        System.out.println("- 종료일: " + notice.getEndDate());
        System.out.println("=== 전달받은 수정 데이터 ===");
        System.out.println("- 새로운 시작일: " + dto.getStartDate());
        System.out.println("- 새로운 종료일: " + dto.getEndDate());
        
        if (dto.getNtCode() != null) {
            notice.setNtCode(dto.getNtCode());
        }
        if (dto.getNtCategory() != null) {
            notice.setNtCategory(dto.getNtCategory());
        }
        if (dto.getNtContent() != null) {
            notice.setNtContent(dto.getNtContent());
        }
        if (dto.getStartDate() != null) {
            notice.setStartDate(dto.getStartDate());
            System.out.println("시작일 수정됨: " + dto.getStartDate());
        }
        if (dto.getEndDate() != null) {
            notice.setEndDate(dto.getEndDate());
            System.out.println("종료일 수정됨: " + dto.getEndDate());
        }
        
        // 노출기간 검증
        if (notice.getStartDate() != null && notice.getEndDate() != null) {
            if (notice.getStartDate().isAfter(notice.getEndDate())) {
                throw new IllegalArgumentException("시작일은 종료일보다 이전이어야 합니다.");
            }
        }
        
        NoticeEntity savedNotice = noticeRepository.save(notice);
        System.out.println("수정 후 공지사항 상태:");
        System.out.println("- ID: " + savedNotice.getNtKey());
        System.out.println("- 시작일: " + savedNotice.getStartDate());
        System.out.println("- 종료일: " + savedNotice.getEndDate());
        
        return savedNotice;
    }

    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void deleteExpiredNotices() {
        noticeRepository.deleteByEndDateBefore(LocalDate.now());
        System.out.println("만료된 공지사항 삭제 완료: " + LocalDate.now());
    }
}
