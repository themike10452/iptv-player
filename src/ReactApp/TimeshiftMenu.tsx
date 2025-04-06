import React from "react";
import { addDays, addHours, addMilliseconds, format, isSameDay, startOfHour } from "date-fns";
import { useSettings } from "./Settings";
import classNames from "classnames";
import { useOnClickOutside } from "usehooks-ts";

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
				? `${format(from, "hh:mm:ss a")} - ${format(to, "hh:mm:ss a")}`
				: `${format(from, "E MMM dd hh:mm:ss a")} - ${format(to, "E MMM dd hh:mm:ss a")}`;

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
			hideMenu();
		}, [stream, settings, hideMenu, setVideoUrl]);

	const switchToLiveStream = React.useCallback(() => {
		setVideoUrl(liveStreamUrl);
		setSelectedOptionId(null);
		hideMenu();
	}, [liveStreamUrl, hideMenu, setVideoUrl]);

	const ref = React.useRef(null);
	useOnClickOutside(ref, hideMenu);

	return (
		<div ref={ref} className="timeshift-menu">
			<div className={classNames("timeshift-menu-option", { active: !selectedOptionId })} onClick={switchToLiveStream}>Live</div>
			{timeshiftOptions.map((e, idx) => (
				<div key={idx} className={classNames("timeshift-menu-option", { active: e.id === selectedOptionId })} onClick={() => onClickTimeshiftOption(e)}>{e.title}</div>
			))}
		</div>
	)
};
