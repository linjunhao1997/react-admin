import axios from "axios";

interface Result {
  total: number;
  list: [];
}

export const getTableData =
  (url: string) =>({ current, pageSize, sorter }, formData: any): Promise<Result> => {
    const like = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (value) {
        like[key] = value;
      }
    });
    const sorters = {};
    if (sorter) {
      if (Array.isArray(sorter)) {
        sorter.map((el, index) => {
          if (sorter[index].order === "ascend") {
            sorters[sorter[index].field] = 1;
          } else if (sorter[index].order === "descend") {
            sorters[sorter[index].field] = -1;
          } else {
            delete sorters[sorter[index].field];
          }
          return;
        });
      } else {
        if (sorter.order === "ascend") {
          sorters[sorter.field] = 1;
        } else if (sorter.order === "descend") {
          sorters[sorter.field] = -1;
        } else {
          delete sorters[sorter.field];
        }
        Object.keys(sorters).forEach((field, index) => {
          if (field !== sorter.field) {
            delete sorters[field];
          }
        });
      }
    }

    const data = {
      page: current,
      pageSize: pageSize,
      filter: {
        like: like,
      },
    };
    return axios.post(url, data).then((resp) => {
      console.log(resp);
      return{
        total: resp.data.total,
        list: resp.data.list,
      };
    });
  };

export const getSingleData = (url: string) => {
  return axios.get(url);
};

export const updateSingleRecord = (url: string, data: any) => {
  return axios.patch(url, data);
};

export const insertNewRecord = (url: string, data: any) => {
  return axios.post(url, data);
};

export const deleteSingleRecord = (url: string) => {
  return axios.delete(url);
};
