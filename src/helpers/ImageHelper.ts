type imageOptions = {
  w?: number;
  h?: number;
  radius?: number;
};

class ImageHelper {
  imgConfig: any = null;
  imgDomain?: string = '';

  initial(domain: string, config: any) {
    this.imgConfig = config;
    this.imgDomain = domain;
  }

  normalizeAvatar = (name: string, id: string) => {
    if (!name && id?.substring(0, 2) === '0x') {
      return {address: id};
    }
    if (name?.includes?.('http')) return name;
    return `${this.imgDomain}${id}/${name}`;
  };

  normalizeImage = (
    name: string,
    id: string,
    options: imageOptions = {},
    noParams = false,
  ) => {
    if (this.imgDomain === '' || this.imgConfig == null || name == null)
      return '';
    if (name.includes('.gif') || noParams) {
      return `${this.imgDomain}${id}/${name}`;
    }
    let params = '?auto=format&fit=crop';
    if (options.w || options.h) {
      params += `&dpr=2.0&fm=jpg&q=50`;
    }
    if (options.w) {
      params += `&w=${options.w}`;
    }
    if (options.h) {
      params += `&h=${options.h}`;
    }
    if (options.radius) {
      params += `&corner-radius=${options.radius},${options.radius},${options.radius},${options.radius}&mask=corners`;
    }
    return `${this.imgDomain}${id}/${name}${params}`;
  };
}

export default new ImageHelper();
