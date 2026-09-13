

const ToolCard = ({tool}) => {
  const toolIcon = tool.toLowerCase()
  return (
    <div className="w-20 h-20 flex flex-col justify-center items-center my-4" key={tool}>
      <img src={"/icons/" + toolIcon + ".png"} alt={tool} />
      <div>
        <p className="text-sm italic">{tool}</p>
      </div>
    </div>
  );
};

export default ToolCard;
