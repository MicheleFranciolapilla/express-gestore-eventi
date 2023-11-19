module.exports  =   function(error, request, response, next)
                    {
                        response.status(500);
                        response.format(
                                        {
                                            html:       ()  =>
                                                {
                                                    response.type("html");
                                                    response.send("<h1>Errore (500) interno al server (Provvisorio)</h1>");
                                                },
                                            json:       ()  =>
                                                {
                                                    response.json({ "Errore 500"    :   "Errore interno al server (Provvisorio)"});
                                                },
                                            default:    ()  =>
                                                {
                                                    response.type("text");
                                                    response.send("Errore (500) interno al server (Provvisorio)");
                                                }
                                        });
                    }