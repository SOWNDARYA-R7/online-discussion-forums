document.getElementById("btn")?.addEventListener("click",function(){
    const email = document.querySelector("input[name='email']").value;
    const password = document.querySelector("input[name ='password']").value;

    fetch("http://localhost:3000/login",{
        method: "POST",
        headers:{
            "Content-Type" : "application/json"
        },
        body: JSON.stringify({email, password})
    })
    .then(res=>res.json())
    .then(data => alert(data.message));
});

document.getElementById("btn2")?.addEventListener("click",function(){
    console.log("Button clicked ✅");
const username = document.querySelector("input[name='username']").value;
const email = document.querySelector("input[name='email']").value;
const password = document.querySelector("input[name='password']").value;

    fetch("http://localhost:3000/register",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({username, email, password})
    })
 .then(res.json())
 .then(data => alert(data.message));
});