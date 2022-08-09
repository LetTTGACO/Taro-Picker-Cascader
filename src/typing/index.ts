export interface DataSource {
  label: string;
  value: any;
  children?: DataSource[]
}

export interface Tab {
  title: string;
  value: string;
  dataSource: DataSource[];
}

