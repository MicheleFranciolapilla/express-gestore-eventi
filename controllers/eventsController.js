// Importazione modello
const   express         =   require("express");
const   EventModel      =   require("../models/EventModel");
const   allowedFilters  =   {
                                title       :   ["t_with"],
                                description :   ["d_with"],
                                eventDate   :   ["f_exact", "f_before", "f_after"],
                                maxSeats    :   ["s_less_than", "s_more_than"]
                            }

function showAllEventsInstances()
{
    for (let i = 0; i < EventModel.eventInstances.length; i++)
    {
        console.log("******************************************");
        console.log(`Istanza nr ${i}:`);
        const instance = EventModel.getInstance(i);
        console.log(`ID :     ${instance.id}`);
        console.log(`title :     ${instance.title}`);
        console.log(`description :     ${instance.description}`);
        console.log(`eventDate :     ${instance.eventDate}`);
        console.log(`maxSeats :     ${instance.maxSeats}`);
        console.log("******************************************");
    }
}

function getValidQueries(request)
{
    const   queries =   Object.keys(request.query);
}

function index(request, response)
{
    // Si verifica l'eventuale presenza di query strings nella rotta, a condizione che ci siano eventi nel db
    const   eventsInDB  =   EventModel.eventsInDB();
    if (eventsInDB != 0)
    {
        var queries         =   Object.keys(request.query);
        // Si salvano in un array tutte le queries valide, per eventuali usi futuri; al momento si prende in considerazione solo l'ultima di esse
        var validQueries    =   queries.filter(queryStr =>  
            {
                if (allowedFilters.includes(queryStr))
                {
                    if (EventModel.isValidDate(request.query[queryStr]))
                        return true;
                }
            });
        console.log("Queries valide: ", validQueries);
        var lastValidQuery  =   validQueries.length != 0    ?   validQueries[validQueries.length - 1]   :   null;
        var allEvents       =   EventModel.getAllEvents();
        if (lastValidQuery)
        {
            var dateTime        =   request.query[lastValidQuery];
            var filteredEvents  =   allEvents.filter( singleEvent   =>
                {

                });
            console.log("Query ok: ", lastValidQuery);
        }
    }
    showAllEventsInstances();
    response.format({
                        html:       ()  =>
                            {
                                response.type("html");
                                if (eventsInDB == 0)
                                    response.send("<h1>Non ci sono eventi nel database.</h1>");
                                else
                                {
                                    let output = ["<ul>"];
                                    allEvents.forEach( singleEvent  =>
                                        {
                                            output.push("<li>");
                                            for (let key in singleEvent)
                                                // if (singleEvent.hasOwnProperty(key))
                                                {
                                                    let tagOpen     =   `<a href="/events/${singleEvent.id}"><h1>`;
                                                    let tagClose    =   "</h1></a>"; 
                                                    if (!["id", "title"].includes(key))
                                                    {
                                                        tagOpen     =   "<h3>";
                                                        tagClose    =   "</h3>";
                                                    }
                                                    output.push(`${tagOpen}${key}:   ${singleEvent[key]}${tagClose}`);
                                                }
                                            output.push("</li>");
                                        });
                                    output.push("</ul>");
                                    response.send(output.join(""));
                                }
                            },
                        default:    ()  =>
                            {
                                let jsonResponse = { "Totale eventi" : eventsInDB};
                                if (eventsInDB != 0)
                                    jsonResponse.Eventi = allEvents;
                                response.json(jsonResponse);
                            }
                    });
}

function show(request, response)
{
    const actualEvent   = EventModel.getEvent(request.params.event);
    showAllEventsInstances();
    response.format({
                        html:       ()  =>
                            {
                                response.type("html");
                                let output = [];
                                for (let key in actualEvent)
                                    // if (actualEvent.hasOwnProperty(key))
                                    {
                                        let tagOpen     =   '<h1>';
                                        let tagClose    =   "</h1>"; 
                                        if (!["id", "title"].includes(key))
                                        {
                                            tagOpen     =   "<h3>";
                                            tagClose    =   "</h3>";
                                        }
                                        output.push(`${tagOpen}${key}:   ${actualEvent[key]}${tagClose}`);
                                    }
                                response.send(output.join(""));
                            },
                        default:    ()  =>
                            {
                                response.json(actualEvent);
                            }
                    });
}

function store(request, response)
{
    const {title, description, eventDate, maxSeats} =   request.body;
    const newEvent                                  =   new EventModel(title, description, eventDate, maxSeats);
    const newEventId                                =   EventModel.getLastGeneratedId();
    const newEventConfirmed                         =   EventModel.getEvent(newEventId);
    showAllEventsInstances();
    response.format({
                        html:       ()  =>
                            {
                                response.type("html");
                                let output = ['<h1 style="text-align:center; color:blue; text-decoration:underscore;">Evento generato con successo</h1>'];
                                output.push(`<h2 style="text-align:center; color:blue; text-decoration:underscore;">Id associato all'evento: ${newEventId}</h2>`);
                                let flexBox     =   '<div style="display:flex; justify-content:space-evenly; width:100vw;">@</div>';
                                let leftBox     =   '<div style="padding:15px; display:flex; flex-direction:column; align-items:start; gap:1vh; border:2px solid green;">@</div>';
                                let rightBox    =   '<div style="padding:15px; display:flex; flex-direction:column; align-items:start; gap:1vh; border:2px solid yellowgreen;">@</div>';
                                let leftData    =   ['<h3 style="font-style:italic; align-self: center;">Dati inviati:</h3>'];
                                let rightData   =   ['<h3 style="font-style:italic; align-self: center;">Dati salvati:</h3>'];
                                for (let key in newEventConfirmed)
                                {
                                    if (key != "id")
                                    {
                                        leftData.push(`<h5 style="font-style:italic; color:blue;">${key} : <span style="font-style:normal; color:black;">${request.body[key]}</span></h5>`);
                                        rightData.push(`<h5 style="font-style:italic; color:blue;">${key} : <span style="font-style:normal; color:black;">${newEventConfirmed[key]}</span></h5>`);
                                    }
                                }
                                leftBox     =   leftBox.replace("@", leftData);
                                console.log(leftBox);
                                rightBox    =   rightBox.replace("@", rightData);
                                console.log(leftBox);
                                flexBox     =   flexBox.replace("@", leftBox.concat(rightBox));
                                output.push(flexBox);
                                response.send(output.join(""));
                            },
                        default:    ()  =>
                            {
                                let sent    =   {};
                                let saved   =   {};
                                for (let key in newEventConfirmed)
                                {
                                    if (key != "id")
                                    {
                                        sent[key]   =    request.body[key];
                                        saved[key]  =    newEventConfirmed[key];
                                    }
                                }
                                response.json(  {
                                                    "Esito salvataggio evento"  :   "Evento registrato con successo",
                                                    "Id generato per l'evento"  :   newEventId,
                                                    "Dati inviati:"             :   sent,
                                                    "Dati salvati:"             :   saved
                                                });
                            }
                    });
}

function update(request, response)
{
    const   eventId                                     =   request.params.event;
    let     eventBeforeModify                           =   EventModel.getEvent(eventId);
    const   {title, description, eventDate, maxSeats}   =   request.body;
    const   modifiersObj                                =   {title, description, eventDate, maxSeats};
    EventModel.modifyEvent(eventId, modifiersObj);
    let     eventAfterModify                            =   EventModel.getEvent(eventId);
    delete eventBeforeModify.id;
    delete eventAfterModify.id;
    showAllEventsInstances();
    response.format({
                        html:       ()  =>
                            {
                                response.type("html");
                                let output = ['<h1 style="color:blue; text-decoration:underscore;">Evento modificato con successo</h1>'];
                                output.push(`<h2 style="color:blue; text-decoration:underscore;">Id associato all'evento: ${eventId}</h2><br><br>`);
                                output.push('<h3 style="font-style:italic; color:green;">Evento prima della modifica:</h3>');
                                for (let key in eventBeforeModify)
                                    output.push(`<h5 style="font-style:italic; color:blue;">${key} : <span style="font-style:normal; color:black;">${eventBeforeModify[key]}</span></h5>`);
                                output.push('<br><h3 style="font-style:italic; color:yellowgreen;">Evento dopo la modifica:</h3>');
                                for (let key in eventAfterModify)
                                    output.push(`<h5 style="font-style:italic; color:blue;">${key} : <span style="font-style:normal; color:black;">${eventAfterModify[key]}</span></h5>`);
                                response.send(output.join(""));
                            },
                        default:    ()  =>
                            {

                                response.json(  {
                                                    "Evento modificato con successo"    :   `Id evento: ${eventId}`,
                                                    "Evento prima della modifica"       :   eventBeforeModify,
                                                    "Evento dopo la modifica"           :   eventAfterModify
                                                });
                            }
                    });
}

function destroy(request, response)
{
    const   eventId         =   request.params.event;
    const   eventToDelete   =   EventModel.getEvent(eventId);
    EventModel.deleteEvent(eventId);
    showAllEventsInstances();
    response.format({
                        html:       ()  =>
                            {
                                response.type("html");
                                response.send(`<h1 style="color:red;">L'evento con id: ${eventId} - titolo: ${eventToDelete.title}, è stato cancellato come richiesto!</h1>`);
                            },
                        default:    ()  =>
                            {
                                response.json({ "Evento cancellato con successo"    :   `id: ${eventId} - titolo: ${eventToDelete.title}, non più presente nel DB!` });
                            }
                    });
}

module.exports  =   { index, show, store, update, destroy };