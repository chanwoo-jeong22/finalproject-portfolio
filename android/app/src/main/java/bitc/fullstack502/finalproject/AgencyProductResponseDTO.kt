package bitc.fullstack502.finalproject

// AgencyProductResponseDTO.kt
data class AgencyProductResponseDTO(
    val pdKey: Int,
    val pdNum: String,
    val pdProducts: String,
    val pdPrice: Int
) {
    var quantity: Int = 0           // 사용자가 입력할 수량
    var total: Int = 0              // quantity * price
    var isSelected: Boolean = false // 선택 여부
}
