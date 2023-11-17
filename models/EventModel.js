// Importazione librerie
const   fileSystem      =   require("fs");
const   path            =   require("path");

// Definizione del database (.json)
const   eventsDB        =   "eventsDB.json";
const   eventsDBPath    =   path.resolve("public", eventsDB);

// Implementazione classe EventModel
class   EventModel
{
    // Proprietà private

    #id;
    #title;
    #titleSlug;
    #description;
    #date;
    #maxSeats;

    // Costruttore e metodi

    // Per il momento stabiliamo che gli unici attributi indispensabili per la creazione di un nuovo evento siano il titolo, la data ed il numero di posti a sedere
    // L'id lo genereremo automaticamente di modo che sia univoco, mentre la descrizione dell'evento verrà settata in seguito (opzionale)
    constructor(_title, _date, _maxSeats)
    {
        this.#setUniqueId();
        this.#title     =   _title;
        this.#date      =   _date;
        this.#maxSeats  =   _maxSeats;
        EventModel.addEvent(this.#id, this.#title, this.#date, this.#maxSeats);

    }

    // Metodi private
    #setUniqueId()
    {
        const allEvents = EventModel.getAllEvents();
        const allIds = allEvents.map( (event) => event.id );
        this.#id = allIds.length != 0 ? Math.max(...allIds) + 1 : 1;
        console.log("ID: ", this.#id);
    }

    // Metodi statici
    static  checkDBExistance()
    {
        return fileSystem.existsSync(eventsDBPath);
    }

    static  fromObjToArray(objToArray)
    {
        const simpleObj = objToArray;
        let arrayToReturn = [];
        arrayToReturn.push(simpleObj);
        return arrayToReturn;
    }

    static  getAllEvents()
            {
                if (!EventModel.checkDBExistance())
                {
                    console.log("file non esiste..... lo si crea!");
                    fileSystem.writeFileSync(eventsDBPath, "");
                    return [];
                }
                else
                {
                    console.log("file esiste");
                    const fileContent = fileSystem.readFileSync(eventsDBPath, "utf-8");
                    if (fileContent == "")
                    {
                        console.log("file senza contenuto.....restituisco array vuoto");
                        return [];
                    }
                    else
                    {
                        console.log("file con contenuto");
                        let jsonFileData = null;
                        try
                        {
                            jsonFileData = JSON.parse(fileContent);
                            console.log("tento il parsing in formato json....... ", jsonFileData);
                        }
                        catch(error)
                        {
                            console.log("file corrotto..... lo si ricrea!");
                            fileSystem.writeFileSync(eventsDBPath, "");
                            return [];
                        }
                        console.log("Nessun errore nel parsing");
                        if (!Array.isArray(jsonFileData))
                        {
                            console.log("jsonfiledata non è un array.... ");
                            jsonFileData = EventModel.fromObjToArray(jsonFileData);
                            console.log("jsonfiledata  ora è un array.... ", jsonFileData);
                        }
                        return jsonFileData;
                    }
                }
            } 

    static  getEvent(eventId)
    {
        const allEvents = EventModel.getAllEvents();
        if (allEvents.length == 0)
            throw new Error("Nessun evento esistente!");
        const eventIndex = allEvents.findIndex( eventChecked => eventChecked.id == eventId);
        if (eventIndex < 0)
            throw new Error("Evento non presente nel DB!");
        return allEvents[eventIndex];
    }

    static  addEvent(_id, _title, _date, _maxSeats)
    {
        const   eventToAdd  =   {
                                    "id"        :   _id,
                                    "title"     :   _title,
                                    "date"      :   _date,
                                    "maxSeats"  :   _maxSeats
                                };
        let allEvents = EventModel.getAllEvents();
        allEvents.push(eventToAdd);
        try
        {
            fileSystem.writeFileSync(eventsDBPath, JSON.stringify(allEvents));
        }
        catch (error)
        {
            throw new Error("Evento rigettato!");
        }
    }
}

module.exports = EventModel;