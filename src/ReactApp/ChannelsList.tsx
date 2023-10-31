import React from "react";
import { FocusZone, FocusZoneDirection, List } from "@fluentui/react";

export interface IChannel {
  stream_id: string;
  name: string;
  stream_icon?: string;
}

export interface IChannelsListProps {
  items: IChannel[];
  selectedChannel?: IChannel | null;
  onItemSelected?: (item: IChannel) => void;
}

export const ChannelsList: React.FC<IChannelsListProps> = (props) => {
  const { items, onItemSelected, selectedChannel } = props;

  const onItemClick = React.useCallback(
    (item: IChannel) => {
      if (onItemSelected) {
        onItemSelected(item);
      }
    },
    [onItemSelected]
  );

  const renderItem = React.useCallback(
    (item: IChannel) => {
      return (
        <div
          title={item.name}
          className={`side-nav-list-item ${
            item.stream_id === selectedChannel?.stream_id ? "active" : ""
          }`}
          onClick={() => onItemClick(item)}
          data-is-focusable
        >
          <div className="channel-list-item-content">
            <div className="channel-icon-wrapper">
              {item.stream_icon && (
                <img
                  className="channel-icon"
                  src={item.stream_icon}
                  loading="lazy"
                />
              )}
            </div>
            <div className="channel-name">{item.name}</div>
          </div>
        </div>
      );
    },
    [onItemClick, selectedChannel]
  );

  return (
    <FocusZone direction={FocusZoneDirection.vertical}>
      <List items={items} onRenderCell={renderItem} version={selectedChannel} />
    </FocusZone>
  );
};
