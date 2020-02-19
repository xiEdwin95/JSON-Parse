function setting(data) {
    let dockArr = data;
    for (const prop in dockArr) {
        var btn = $(
            `<button id="${prop}" style="margin: 1rem" type="button" class="btn btn-primary">${prop}</button>`
        );
        btn.on("click", function(event) {
            publishFunction(
                dockArr[prop].topic,
                dockArr[prop].testcases,
                prop,
                dockArr[prop].interval
            );
        });
        $("#data").append(btn);
    }
}

function publishFunction(topic, subscribeFunction, log, time) {
    alert("MQTT Broadcasting " + log + " Data");
    console.log("MQTT Broadcasting " + log + " Data");
    counter = 0;
    let timer = setInterval(() => {
        client.publish(topic, JSON.stringify(subscribeFunction[counter]));
        console.log(subscribeFunction[counter]);
            counter++;
        if (counter == subscribeFunction.length) {
            clearInterval(timer);
            console.log("MQTT Broadcasting " + log + " Completed");
            alert("MQTT Broadcasting " + log + " Completed");
        }
    }, time);
}

function handleFiles(event){
    
    var input = event.target;

    var reader = new FileReader();
    reader.onload = function(){
      var text = reader.result;
        setting(JSON.parse(text))
    };
    reader.readAsText(input.files[0]);
}
