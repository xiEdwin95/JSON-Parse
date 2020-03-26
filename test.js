let mission;
function setting(data) {
    let dockArr = data;
    for (const prop in dockArr) {
        let btn = $(
            `<button id="${prop}" style="margin: 1rem" type="button" class="btn btn-primary">${prop}</button>`
        );
        btn.on("click", () => {
            if (dockArr[prop].missionTopic === undefined) {
                mission = window.open("mission.html");
                mission.onload = sendMessage(
                    dockArr[prop].topic,
                    dockArr[prop].testcases,
                    prop,
                    dockArr[prop].interval
                );
            } else {
                mission = window.open("mission.html");
                mission.onload = sendMission(
                    dockArr[prop].topic,
                    dockArr[prop].missionTopic,
                    dockArr[prop].testcases,
                    prop,
                    dockArr[prop].interval
                );
            }
        });
        $("#data").append(btn);
    }
}

function sendMission(topic, mtopic, testcases, prop, interval) {
    setTimeout(() => {
        let msg = {
            topic: topic,
            testcases: testcases,
            prop: prop,
            interval: interval,
            mtopic: mtopic
        };
        mission.postMessage(msg, "*");
    }, 200);
}

function sendMessage(topic, testcases, prop, interval) {
    setTimeout(() => {
        let msg = {
            topic: topic,
            testcases: testcases,
            prop: prop,
            interval: interval
        };
        mission.postMessage(msg, "*");
    }, 200);
}

function receiveMessage() {
    window.addEventListener("message", function(event) {
        if (event.data.mtopic === undefined) {
            abortMission(event.data.topic+event.data.prop)
            publishFunction(
                event.data.topic,
                event.data.testcases,
                event.data.prop,
                event.data.interval
            );
        } else {
            abortMission(event.data.mtopic+event.data.prop);
            publishMission(
                event.data.topic,
                event.data.mtopic,
                event.data.testcases,
                event.data.prop,
                event.data.interval
            );
        }
    });
}



function abortMission(currentTopic){
    client.subscribe(`${currentTopic}`);
    client.on('message',(topic,message)=>{    
    if(message.toString() === 'abort' && topic === currentTopic)
    {
    console.log(topic)
    isAbort = true;
    console.log('Aborting Detected')
    }
    })
    let btn = $(
        ` <button type="button" class="btn btn-danger btn-lg" style="padding: 10px 50px;" onclick="abort('${currentTopic}')">Abort</button>`
    );
    $("#data").append(btn);
}

function abort(currentTopic) {
    client.publish(currentTopic,'abort');
}

function publishMission(topic, mtopic, subscribeFunction, log, time) {
    // alert("MQTT Broadcasting " + log + " Data");
    isAbort = false;
    console.log("MQTT Broadcasting " + log + " Data");
    counter = 1;
    client.publish(mtopic, JSON.stringify(subscribeFunction[0]));
    console.log(subscribeFunction[0]);

    let timer = setInterval(() => {
        if (!isAbort) {
            client.publish(topic, JSON.stringify(subscribeFunction[counter]));
            console.log(subscribeFunction[counter]);
            let txt = $(`<p>${JSON.stringify(subscribeFunction[counter])}</p>`);

            $("#data").append(txt);
            let progressed = Math.floor(
                ((counter + 1) / (subscribeFunction.length - 1)) * 100
            );

            $("#moving-progress-bar")
                .css("width", progressed + "%")

                .attr("aria-valuenow", progressed)

                .text("Publishing " + progressed + "% progress");
            counter++;
            if (counter == subscribeFunction.length - 1) {
                clearInterval(timer);
                client.publish(
                    mtopic,
                    JSON.stringify(subscribeFunction[counter])
                );
                console.log(subscribeFunction[counter]);
                console.log("MQTT Broadcasting " + log + " Completed");
                counter++;
            }
        } else if (isAbort) {
            clearInterval(timer);
            let count = subscribeFunction.length - 1;
            console.log(subscribeFunction[count]);
            subscribeFunction[count].description = { status: "FAILED" };
            subscribeFunction[
                count
            ].eventDateTime = new Date().toLocaleString("sv", {
                timeZoneName: "short"
            });
            client.publish(mtopic, JSON.stringify(subscribeFunction[count]));
            let txt = $(`<p>Mission Log: ${JSON.stringify(subscribeFunction[count])}</p>`);
            $("#data").append(txt);
            logCount = count - 1;
            subscribeFunction[logCount].id = counter;
            subscribeFunction[
                logCount
            ].eventDateTime = new Date().toLocaleString("sv", {
                timeZoneName: "short"
            });
            client.publish(topic, JSON.stringify(subscribeFunction[logCount]));
            txt = $(`<p>Drone abort to E-Land: ${JSON.stringify(subscribeFunction[logCount])}</p>`);
            $("#data").append(txt);
            let progressed = 100;
            $("#moving-progress-bar")
                .css("width", progressed + "%")

                .attr("aria-valuenow", progressed)

                .text("Publishing " + progressed + "% progress");
                console.log("MQTT Broadcasting " + log + " Aborted");
        }
    }, time);
}


function publishFunction(topic, subscribeFunction, log, time) {
    isAbort = false;
    console.log("MQTT Broadcasting " + log + " Data");
    counter = 0;
    let timer = setInterval(() => {
        if (!isAbort) {
            client.publish(topic, JSON.stringify(subscribeFunction[counter]));
            console.log(subscribeFunction[counter]);
            let txt = $(`<p>${JSON.stringify(subscribeFunction[counter])}</p>`);

            $("#data").append(txt);
            let progressed = Math.floor(
                ((counter + 1) / subscribeFunction.length) * 100
            );

            $("#moving-progress-bar")
                .css("width", progressed + "%")

                .attr("aria-valuenow", progressed)

                .text("Publishing " + progressed + "% progress");
            counter++;
            if (counter == subscribeFunction.length) {
                clearInterval(timer);
                console.log("MQTT Broadcasting " + log + " Completed");
            }
        } else if (isAbort) {
            clearInterval(timer);
            let txt = $(`<p>${log} has been adort</p>`);

            $("#data").append(txt);
            let progressed = 100;
            $("#moving-progress-bar")
                .css("width", progressed + "%")

                .attr("aria-valuenow", progressed)

                .text("Publishing " + progressed + "% progress");
        }
    }, time);
}

function handleFiles(event) {
    var input = event.target;

    var reader = new FileReader();
    reader.onload = function() {
        var text = reader.result;
        setting(JSON.parse(text));
    };
    reader.readAsText(input.files[0]);
}
