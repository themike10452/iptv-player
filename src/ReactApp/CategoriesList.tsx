import React from "react";
import { FocusZone, FocusZoneDirection, List } from "@fluentui/react";

export interface ICategory {
  category_id: string;
  category_name: string;
}

export interface ICategoriesListProps {
  items: ICategory[];
  selectedCategory?: ICategory | null;
  onItemSelected?: (item: ICategory) => void;
}

export const CategoriesList: React.FC<ICategoriesListProps> = (props) => {
  const { items, onItemSelected, selectedCategory } = props;

  const onItemClick = React.useCallback(
    (item: ICategory) => {
      if (onItemSelected) {
        onItemSelected(item);
      }
    },
    [onItemSelected]
  );

  const renderItem = React.useCallback(
    (item: ICategory) => {
      return (
        <div
          title={item.category_name}
          className={`side-nav-list-item ${
            item.category_id === selectedCategory?.category_id ? "active" : ""
          }`}
          onClick={() => onItemClick(item)}
          data-is-focusable
        >
          {item.category_name}
        </div>
      );
    },
    [onItemClick, selectedCategory]
  );

  return (
    <FocusZone direction={FocusZoneDirection.vertical}>
      <List
        items={items}
        onRenderCell={renderItem}
        version={selectedCategory}
      />
    </FocusZone>
  );
};
