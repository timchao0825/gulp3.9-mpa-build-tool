// Demo es6 , es5 
console.log('ES2016');
let string = "Javascript";
for (let char of string) {
 console.log(char);
}

let NewOneWithParameters = (a, b) => {
  console.log(a + b); // 30
}
NewOneWithParameters(10, 20);

$(document).ready(function(){
  console.log('ES2015');
});

setTimeout(() => { console.log("JQuery log"); }, 1000);