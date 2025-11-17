package bitc.fullstack502.finalproject

data class OrderDTO(
    val orKey: Int,          // 주문번호
    val agKey: Int,          // 대리점 키 (로그인한 사용자 필터용)
    val orDate: String?,     // 주문일
    val orStatus: String?,   // 처리 상태
    val orReserve: String?,  // 도착 예정일
    val dvName: String?,     // 배송기사 이름
    val dvPhone: String?,    // 배송기사 전화번호
    val orTotal: Int         // 총액
)