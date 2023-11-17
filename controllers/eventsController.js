// Importazione modello
const   express     =   require("express");
const   eventModel  =   require("../models/EventModel");

function index(request, response)
{
    const   eventsInDB  = eventModel.eventsInDB();
    const   allEvents   = eventModel.getAllEvents();
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
                                                if (singleEvent.hasOwnProperty(key))
                                                {
                                                    let tagOpen     =   '<a href="#"><h1>';
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
    if (eventModel.eventsInDB() == 0)
        throw new Error("Nessun evento esistente!");
    const allEvents     = eventModel.getAllEvents();
    const eventIndex    = allEvents.findIndex( singleEvent  =>  singleEvent.id == request.params.event);
    if (eventIndex < 0)
        throw new Error("Evento non presente nel DB!");
    const actualEvent   = allEvents[eventIndex];
    response.format({
                        html:       ()  =>
                            {
                                response.type("html");
                                let output = [];
                                for (let key in actualEvent)
                                    if (actualEvent.hasOwnProperty(key))
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
    response.send("Sono il controller events/store (post)");
}

function update(request, response)
{
    response.send(`Sono il controller events/update (put) con evento: ${request.params.event}`);
}

module.exports  =   { index, show, store, update };