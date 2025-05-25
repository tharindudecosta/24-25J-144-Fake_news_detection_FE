type ContentBarProps = {
  fakeCount: number | string;
  totalCount: number | string;
};

const ContentBar: React.FC<ContentBarProps> = ({ fakeCount, totalCount }) => {
  const fake = parseFloat(fakeCount as string);
  const total = parseFloat(totalCount as string);
  const real = total - fake;

  const fakePercent = (fake / total) * 100;
  const realPercent = (real / total) * 100;

  const isFakeDominant = fake > real;
  const dominantLabel = isFakeDominant ? "Fake Content Detected" : "Real Content Detected";
  const dominantColor = isFakeDominant ? "text-red-600" : "text-green-600";
  const barColor = isFakeDominant ? "bg-red-500" : "bg-green-500";
  const displayPercent = isFakeDominant ? fakePercent : realPercent;

  return (
    <div className="mb-6">
      {/* Header */}
      <h3 className="text-lg font-semibold mb-2">
        {dominantLabel}:{" "}
        <span className={`${dominantColor}`}>
          {displayPercent.toFixed(1)}%
        </span>
      </h3>

      {/* Bar */}
      <div className="flex items-center">
        <span className="w-28 text-sm">
          {dominantLabel.split(" ")[0]} Frames:
        </span>
        <div className="flex-1 h-5 bg-gray-300 rounded-full overflow-hidden">
          <div
            className={`h-full ${barColor} transition-all duration-500 ease-in-out`}
            style={{ width: `${displayPercent}%` }}
          ></div>
        </div>
        <span className="ml-3 text-sm font-medium text-gray-700">
          {displayPercent.toFixed(1)}%
        </span>
      </div>
    </div>
  );
};

export default ContentBar;
