function index(request, response)
{
    response.send("Sono il controller events/index (get)");
}

function store(request, response)
{
    response.send("Sono il controller events/store (post)");
}

function update(request, response)
{
    response.send(`Sono il controller events/update (put) con evento: ${request.params.event}`);
}

module.exports  =   { index, store, update };