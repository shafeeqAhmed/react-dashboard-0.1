import axios from "axios";

const instance = axios.create();

instance.interceptors.request.use(function (request) {
    request.headers.common['Content-Type'] = 'application/json; charset=utf-8';
       return request;
}, function (error) {
    return Promise.reject(error);
});

export default instance