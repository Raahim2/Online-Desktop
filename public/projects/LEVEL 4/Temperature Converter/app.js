let x=document.getElementById('x')
let y=document.getElementById('y')

let unit1=document.getElementById('unit1')
let unit2=document.getElementById('unit2')

let u1=document.getElementById('u1')
let u2=document.getElementById('u2')


function start(){
    let txt1=unit1.value
    let txt2=unit2.value

    if(txt1=="c"&&txt2=="c"){
    u1.innerHTML="Celsius (°C)"
    u2.innerHTML="Celsius (°C)"
    let q = parseFloat(x.value);
    y.placeholder=q
    }

    if(txt1=="f"&&txt2=="f"){
    u1.innerHTML="Fahrenheit (°F)"
    u2.innerHTML="Fahrenheit (°F)"
    let q = parseFloat(x.value);
    y.placeholder=q
    }

    if(txt1=="k"&&txt2=="k"){
    u1.innerHTML="Kelivn (K)"
    u2.innerHTML="Kelivn (K)"
    let q = parseFloat(x.value);
    y.placeholder=q
    }

    if(txt1=="c"&& txt2=="f"){
    u1.innerHTML="Celsius (°C)"
    u2.innerHTML="Fahrenheit (°F)"
    let q = parseFloat(x.value);
    let a = ((q*9/5)+32)
    y.placeholder=a
    }

    if(txt1=="c"&& txt2=="k"){
    u1.innerHTML="Celsius (°C)"
    u2.innerHTML="Kelivn (K)"
    let q = parseFloat(x.value);
    let a = q+273.15
    y.placeholder=a
    }

    if(txt1=="f"&& txt2=="k"){
    u1.innerHTML="Fahrenheit (°F)"
    u2.innerHTML="Kelivn (K)"
    let q = parseFloat(x.value);
    let a = (q-32)*5/9+273.15
    y.placeholder=a
    }

    if(txt1=="f"&& txt2=="c"){
    u1.innerHTML="Fahrenheit (°F)"
    u2.innerHTML="Celsius (°C)"
    let q = parseFloat(x.value);
    let a = (q - 32) * 5/9 
    y.placeholder=a
    }

    if(txt1=="k"&& txt2=="c"){
    u1.innerHTML="Kelivn (K)"
    u2.innerHTML="Celsius (°C)"
    let q = parseFloat(x.value);
    let a = q - 273.15 
    y.placeholder=a
    }

    if(txt1=="k"&& txt2=="f"){
    u1.innerHTML="Kelivn (K)"
    u2.innerHTML="Fahrenheit (°F)"
    let q = parseFloat(x.value);
    let a = (q - 273.15) * 9/5 + 32  
    y.placeholder=a
    }



}