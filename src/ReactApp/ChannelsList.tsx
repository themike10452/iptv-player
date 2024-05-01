import React from "react";
import { FocusZone, FocusZoneDirection, List } from "@fluentui/react";

export interface IChannelsListProps {
  items: LiveStream[];
  selectedChannel?: LiveStream | null;
  onItemSelected?: (item: LiveStream) => void;
}

export const ChannelsList: React.FC<IChannelsListProps> = (props) => {
  const { items, onItemSelected, selectedChannel } = props;

  const onItemClick = React.useCallback(
    (item: LiveStream) => {
      if (onItemSelected) {
        onItemSelected(item);
      }
    },
    [onItemSelected]
  );

  const renderItem = React.useCallback(
    (item: LiveStream) => {
      const iconUrl = item.stream_icon?.replace(/^http/, "iptv");
      return (
        <div
          title={`${item.name} [${item.stream_id}]`}
          className={`side-nav-list-item ${
            item.stream_id === selectedChannel?.stream_id ? "active" : ""
          }`}
          onClick={() => onItemClick(item)}
          data-is-focusable
        >
          <div className="channel-list-item-content">
            <div className="channel-icon-wrapper">
              {iconUrl && (
                <img
                  className="channel-icon"
                  src={iconUrl}
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
