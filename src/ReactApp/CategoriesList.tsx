import React from "react";
import { FocusZone, FocusZoneDirection, List } from "@fluentui/react";

export interface ICategoriesListProps {
  items: LiveStreamCategory[];
  selectedCategory?: LiveStreamCategory | null;
  onItemSelected?: (item: LiveStreamCategory) => void;
}

export const CategoriesList: React.FC<ICategoriesListProps> = (props) => {
  const { items, onItemSelected, selectedCategory } = props;

  const onItemClick = React.useCallback(
    (item: LiveStreamCategory) => {
      if (onItemSelected) {
        onItemSelected(item);
      }
    },
    [onItemSelected]
  );

  const renderItem = React.useCallback(
    (item: LiveStreamCategory) => {
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
