window.onload = () => {
    let tiltCard = document.querySelector(".tiltCard");
    
    tiltCard.addEventListener("mousemove", (event) => { 
        console.log(tiltCard.clientLeft);
        let e = tiltCard.getBoundingClientRect();

        let x =  event.clientX-e.left;
        let y = event.clientY-e.top;

        let deltaY = y-e.height/2;
        let deltaX = x-e.width/2;
        let magnitude = Math.max( Math.abs(deltaX)/(e.width/2) , Math.abs(deltaY)/(e.height/2));

        tiltCard.style.setProperty("--mouseX", x);
        tiltCard.style.setProperty("--mouseY", y);
        
        //tiltCard.style.setProperty("--tiltX", `${deltaX/(e.width/2) * 20}deg` );
        //tiltCard.style.setProperty("--tiltY", `${deltaY/(e.height/2) * 20}deg`);

        tiltCard.style.setProperty("--light", -(y/(e.height/2))/2  +1.5 )
        tiltCard.style.setProperty("--tiltBX", deltaX /(e.width /2) );
        tiltCard.style.setProperty("--tiltBY", -deltaY/(e.height/2) );
        tiltCard.style.setProperty("--magnitude", magnitude);
    });
}