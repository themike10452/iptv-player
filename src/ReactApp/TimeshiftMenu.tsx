import React from "react";
import classNames from "classnames";
import { IconButton } from "@fluentui/react";
import { addDays, addHours, addMilliseconds, format, isSameDay, startOfHour } from "date-fns";
import { useSettings } from "./Settings";

interface TimeshiftOption {
	id: string;
  title: string;
  from: Date;
  fromFormatted: string;
  to: Date;
  toFormatted: string;
  duration: number;
}

interface TimeshiftMenuProps {
  stream: LiveStream;
	setVideoUrl: (url: string) => void;
	hideMenu: () => void;
}

export const TimeshiftMenu: React.FC<TimeshiftMenuProps> = (props) => {
	const { stream, hideMenu, setVideoUrl } = props;

	const { settings } = useSettings();

	const [selectedOptionId, setSelectedOptionId] = React.useState<string|null>(null);

	const timeshiftOptions = React.useMemo(() => {
		const now = new Date();
		const minDate = startOfHour(addDays(now, -3));

		const options: TimeshiftOption[] = [];

		for (let date = startOfHour(new Date()); date >= minDate; date = addHours(date, -1)) {
			const from = date;
			const to = addMilliseconds(addHours(from, 1), -1);

			const title = isSameDay(from, now)
				? `${format(from, "hh:mm a")} - ${format(to, "hh:mm a")}`
				: `${format(from, "E MMM d / hh:mm a")} - ${format(to, "hh:mm a")}`;

			const id = `${stream.stream_id}-${format(from, "yyyyMMddHHmmss")}-${format(to, "yyyyMMddHHmmss")}`;

			options.push({
				id,
				title,
				from,
				fromFormatted: format(from, "HH:mm:ss"),
				to,
				toFormatted: format(to, "HH:mm:ss"),
				duration: 60,
			});
		}

		return options;
	}, [stream]);

	const liveStreamUrl = React.useMemo(() => {
		if (stream == null) {
			return null;
		}

		const url = new URL(settings.url);
		const protocol = url.protocol?.replace(/^http/, "iptv");
		const optionalPort = url.port ? `:${url.port}` : "";
		return `${protocol}//${url.hostname}${optionalPort}/live/${settings.username}/${settings.password}/${stream.stream_id}.m3u8`;
	}, [stream, settings]);

	const onClickTimeshiftOption = React.useCallback((e: TimeshiftOption) => {
			const ts = format(e.from, `yyyy-MM-dd:HH-mm-ss`);
			console.log(stream);
			// setUrl(`${settings.url}/timeshift/${settings.username}/${settings.password}/${e.duration}/${ts}/${stream.stream_id}.m3u8`.replace("http", "iptv"));
			setVideoUrl(`${settings.url}/timeshift/${settings.username}/${settings.password}/${e.duration}/${ts}/${stream.stream_id}.m3u8`);
			setSelectedOptionId(e.id);
		}, [stream, settings, setVideoUrl]);

	const switchToLiveStream = React.useCallback(() => {
		setVideoUrl(liveStreamUrl);
		setSelectedOptionId(null);
	}, [liveStreamUrl, setVideoUrl]);

	return (
		<div className="timeshift-menu">
			<div className="timeshift-menu-header">
				<IconButton
					iconProps={{ iconName: "Cancel" }}
					onClick={hideMenu}
				/>
			</div>
			<div className="timeshift-menu-scroll scroll">
				<div className={classNames("timeshift-menu-option", { active: !selectedOptionId })} onClick={switchToLiveStream}>Live</div>
				{timeshiftOptions.map((e, idx) => (
					<div key={idx} className={classNames("timeshift-menu-option", { active: e.id === selectedOptionId })} onClick={() => onClickTimeshiftOption(e)}>{e.title}</div>
				))}
			</div>
		</div>
	)
};
