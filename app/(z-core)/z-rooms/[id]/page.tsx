import RoomClient from './RoomClient';

type Props = { params: { id: string } };

export default async function RoomPage(props: Props) {
  // params may be a Promise in some runtimes — unwrap safely
  // eslint-disable-next-line @typescript-eslint/await-thenable
  const params = await (props.params as unknown as Promise<{ id: string }>);
  const id = params?.id;
  return <RoomClient roomId={id} />;
}
