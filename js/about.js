// ==========================================================
// ABOUT PAGE - JAVASCRIPT
// ==========================================================



// ==========================================================
// 1. ANIMAÇÃO DOS ELEMENTOS AO ROLAR A PÁGINA
// ==========================================================

const revealElements = document.querySelectorAll(".reveal");



const revealObserver = new IntersectionObserver(

    (entries) => {

        entries.forEach((entry) => {

            if (entry.isIntersecting) {

                entry.target.classList.add("is-visible");

                revealObserver.unobserve(entry.target);

            }

        });

    },

    {

        threshold: 0.15

    }

);



revealElements.forEach((element) => {

    revealObserver.observe(element);

});





// ==========================================================
// 2. EFEITO 3D NA IMAGEM DO CYBERPUNK
// ==========================================================

const missionVisual =
    document.querySelector("#missionVisual");



if (missionVisual) {


    missionVisual.addEventListener(

        "mousemove",

        (event) => {


            const area =
                missionVisual.getBoundingClientRect();



            const mouseX =
                event.clientX - area.left;



            const mouseY =
                event.clientY - area.top;



            const centerX =
                area.width / 2;



            const centerY =
                area.height / 2;



            const rotateY =
                ((mouseX - centerX) / centerX) * 4;



            const rotateX =
                ((centerY - mouseY) / centerY) * 4;



            missionVisual.style.setProperty(

                "--rotateX",

                `${rotateX}deg`

            );



            missionVisual.style.setProperty(

                "--rotateY",

                `${rotateY}deg`

            );

        }

    );



    missionVisual.addEventListener(

        "mouseleave",

        () => {


            missionVisual.style.setProperty(

                "--rotateX",

                "0deg"

            );


            missionVisual.style.setProperty(

                "--rotateY",

                "0deg"

            );

        }

    );

}





// ==========================================================
// 3. LUZ QUE SEGUE O MOUSE NOS CARDS
// ==========================================================

const visionCards =
    document.querySelectorAll(".vision-card");



visionCards.forEach((card) => {


    card.addEventListener(

        "mousemove",

        (event) => {


            const cardArea =
                card.getBoundingClientRect();



            const mouseX =
                event.clientX - cardArea.left;



            const mouseY =
                event.clientY - cardArea.top;



            card.style.setProperty(

                "--mouse-x",

                `${mouseX}px`

            );



            card.style.setProperty(

                "--mouse-y",

                `${mouseY}px`

            );

        }

    );

});