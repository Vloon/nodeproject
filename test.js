var two_d = [[1,2,3],[4,5,6],[7,8,9]];

// take the third column
function getColumn(array, index) {
    return array.map((value) => value[index]);
}
var col3 = getColumn(two_d, 1)
console.log(col3);