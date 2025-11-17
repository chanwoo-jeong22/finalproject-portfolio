package bitc.fullstack502.finalproject

data class AgencyProductDTO(
    val agName: String,
    val pdNum: String,
    val pdProducts: String,
    val apPrice: Int,
    var quantity: Int = 0,        // 선택 수량
    var isSelected: Boolean = false
)
