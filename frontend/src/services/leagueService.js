import http from "../http-common";

const create = data => {
    return http.post("/admin/league", data);
  };
  const remove = id => {
    return http.delete(`/admin/league/${id}`);
  };
 const update= (id, data) => {
    return http.put(`/admin/league/${id}`, data);
  };

const leagueService = {
    // getAll,
    // get,
    create,
    update,
    remove,
    // removeAll,
    // findByTitle
  };
  
  export default leagueService;