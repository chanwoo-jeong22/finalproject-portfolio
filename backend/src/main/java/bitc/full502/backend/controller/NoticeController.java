package bitc.full502.backend.controller;

import bitc.full502.backend.dto.NoticeDto;
import bitc.full502.backend.entity.NoticeEntity;
import bitc.full502.backend.service.NoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notices")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class NoticeController {

    private final NoticeService noticeService;

    // 공지사항 등록
    @PostMapping
    public NoticeEntity createNotice(@RequestBody NoticeDto dto) {
        return noticeService.createNotice(dto);
    }

    // 공지사항 조회 (전체 또는 분류)
    @GetMapping
    public List<NoticeEntity> getNotices(@RequestParam List<Integer> codes) {
        return noticeService.getNoticesByCodes(codes);
    }

    // 공지사항 삭제
    @DeleteMapping
    public void deleteNotices(@RequestBody List<Integer> ids) {
        noticeService.deleteNotices(ids);
    }

    // 공지사항 수정
    @PutMapping("/{id}")
    public NoticeEntity updateNotice(@PathVariable Integer id, @RequestBody NoticeDto dto) {
        return noticeService.updateNotice(id, dto);
    }
}

