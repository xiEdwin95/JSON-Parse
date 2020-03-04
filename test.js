
let mission; 
function setting(data) {
    let dockArr = data;
    for (const prop in dockArr) {
        let btn = $(
            `<button id="${prop}" style="margin: 1rem" type="button" class="btn btn-primary">${prop}</button>`
        );
        btn.on("click", () => {
            if(dockArr[prop].missionTopic === undefined){
                mission = window.open('mission.html');
                mission.onload = sendMessage(dockArr[prop].topic,dockArr[prop].testcases,prop,dockArr[prop].interval);
            }
            else
            {
                mission = window.open('mission.html');
                mission.onload = sendMission(dockArr[prop].topic,dockArr[prop].missionTopic,dockArr[prop].testcases,prop,dockArr[prop].interval)
            }
          
            // publishFunction(
            //     dockArr[prop].topic,
            //     dockArr[prop].testcases,
            //     prop,
            //     dockArr[prop].interval
            // );
        });
        $("#data").append(btn);
    }
}

function sendMission(topic,mtopic,testcases,prop,interval){
    setTimeout(()=>{
        let msg = { topic:topic , testcases:testcases , prop:prop , interval:interval , mtopic:mtopic };
        mission.postMessage(msg,'*');
    },200)
}



function sendMessage(topic,testcases,prop,interval){
        setTimeout(()=>{
            let msg = { topic:topic , testcases:testcases , prop:prop , interval:interval };
            mission.postMessage(msg,'*');
        },200)
}

function receiveMessage(){
    window.addEventListener("message", function(event) {
        if(event.data.mtopic === undefined){
            publishFunction(event.data.topic,event.data.testcases,event.data.prop,event.data.interval);
        }
        else{
            publishMission(event.data.topic,event.data.mtopic,event.data.testcases,event.data.prop,event.data.interval);
        }
    });
        
}


function publishMission(topic ,mtopic, subscribeFunction, log, time) {
    // alert("MQTT Broadcasting " + log + " Data");
    console.log("MQTT Broadcasting " + log + " Data");
   
    counter = 1;
    client.publish(mtopic,JSON.stringify(subscribeFunction[0]));
    console.log(mtopic);
    console.log(subscribeFunction[0]);
    let timer = setInterval(() => {
        client.publish(topic, JSON.stringify(subscribeFunction[counter]));
        console.log(subscribeFunction[counter]);
        let txt = $(`<p>${JSON.stringify(subscribeFunction[counter])}</p>`)

        $("#data").append(txt);
        let progressed = Math.floor(((counter + 1) / (subscribeFunction.length-1)) * 100)

        $("#moving-progress-bar")

            .css("width", progressed + "%")

            .attr("aria-valuenow", progressed)

            .text("Publishing " + progressed + "% progress");
        counter++;
        if (counter == (subscribeFunction.length-1)) {
            clearInterval(timer);
            client.publish(mtopic,JSON.stringify(subscribeFunction[counter]));
            console.log(subscribeFunction[counter]);
            console.log("MQTT Broadcasting " + log + " Completed");
            counter++
        }
    }, time);
  
     
    
}



function publishFunction(topic, subscribeFunction, log, time) {
    // alert("MQTT Broadcasting " + log + " Data");
    console.log("MQTT Broadcasting " + log + " Data");
    counter = 0;
    let timer = setInterval(() => {
        client.publish(topic, JSON.stringify(subscribeFunction[counter]));
        console.log(subscribeFunction[counter]);
        let txt = $(`<p>${JSON.stringify(subscribeFunction[counter])}</p>`)

        $("#data").append(txt);
        let progressed = Math.floor(((counter + 1) / subscribeFunction.length) * 100)

        $("#moving-progress-bar")

            .css("width", progressed + "%")

            .attr("aria-valuenow", progressed)

            .text("Publishing " + progressed + "% progress");
        counter++;
        if (counter == subscribeFunction.length) {
            clearInterval(timer);
            console.log("MQTT Broadcasting " + log + " Completed");
        }
    }, time);
}


function handleFiles(event) {

    var input = event.target;

    var reader = new FileReader();
    reader.onload = function () {
        var text = reader.result;
        setting(JSON.parse(text))
    };
    reader.readAsText(input.files[0]);
}


