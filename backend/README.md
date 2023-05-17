# Backend project

Backend application for [soundscapes](https://github.com/zazedd/soundscapes).

#Launch database

```sh
docker run --name some-postgres -e POSTGRES_PASSWORD=mysecretpassword -e POSTGRES_USER=root -e POSTGRES_DB=pweb -d -p 5432:5432 postgres
```

# Launch swagger

```sh
docker run -p 80:8080 -e SWAGGER_JSON=/tmp/swagger.json -v $(pwd)/schemes:/tmp --name swagger -d swaggerapi/swagger-ui
```
